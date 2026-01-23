// Servicio de control de versiones usando isomorphic-git
class GitService {
    constructor() {
        this.fs = null;
        this.dir = '/pluma-project';
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Inicializar el sistema de archivos en memoria
            this.fs = new LightningFS('pluma-fs');

            // Intentar abrir el repo existente o crear uno nuevo
            try {
                await git.findRoot({ fs: this.fs, filepath: this.dir });
            } catch (error) {
                // No existe, crear uno nuevo
                await git.init({
                    fs: this.fs,
                    dir: this.dir,
                    defaultBranch: 'main'
                });

                // Configurar autor por defecto
                await git.setConfig({
                    fs: this.fs,
                    dir: this.dir,
                    path: 'user.name',
                    value: 'PlumaAI User'
                });
                await git.setConfig({
                    fs: this.fs,
                    dir: this.dir,
                    path: 'user.email',
                    value: 'user@pluma.local'
                });
            }

            this.initialized = true;
        } catch (error) {
            console.error('Error inicializando Git:', error);
            throw error;
        }
    }

    // Guardar el estado actual del proyecto
    async saveProjectState(projectData, message = 'Auto-save') {
        await this.init();

        try {
            // Convertir el proyecto a JSON
            const content = JSON.stringify(projectData, null, 2);

            // Escribir el archivo
            await this.fs.promises.writeFile(
                `${this.dir}/project.json`,
                content,
                'utf8'
            );

            // Agregar al staging area
            await git.add({
                fs: this.fs,
                dir: this.dir,
                filepath: 'project.json'
            });

            return true;
        } catch (error) {
            console.error('Error guardando estado del proyecto:', error);
            throw error;
        }
    }

    // Crear un commit
    async commit(message, author = null) {
        await this.init();

        try {
            // Si se proporciona autor, actualizar config temporalmente
            if (author) {
                await git.setConfig({
                    fs: this.fs,
                    dir: this.dir,
                    path: 'user.name',
                    value: author.name || 'PlumaAI User'
                });
                if (author.email) {
                    await git.setConfig({
                        fs: this.fs,
                        dir: this.dir,
                        path: 'user.email',
                        value: author.email
                    });
                }
            }

            const sha = await git.commit({
                fs: this.fs,
                dir: this.dir,
                message: message,
                author: author ? {
                    name: author.name || 'PlumaAI User',
                    email: author.email || 'user@pluma.local'
                } : undefined
            });

            return sha;
        } catch (error) {
            console.error('Error creando commit:', error);
            throw error;
        }
    }

    // Obtener el historial de commits
    async getCommitHistory(limit = 50) {
        await this.init();

        try {
            // Verificar si existe la rama main antes de intentar obtener el log
            const branches = await git.listBranches({
                fs: this.fs,
                dir: this.dir
            });

            // Si no hay ramas, significa que no hay commits aún
            if (branches.length === 0) {
                return [];
            }

            const commits = await git.log({
                fs: this.fs,
                dir: this.dir,
                depth: limit
            });

            return commits.map(commit => ({
                oid: commit.oid,
                message: commit.commit.message,
                author: commit.commit.author.name,
                email: commit.commit.author.email,
                timestamp: commit.commit.author.timestamp,
                date: new Date(commit.commit.author.timestamp * 1000),
                parent: commit.commit.parent
            }));
        } catch (error) {
            // Si el error es porque no se encuentra la rama, devolver array vacío
            if (error.code === 'NotFoundError' || error.message.includes('Could not find')) {
                return [];
            }
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }

    // Obtener un commit específico
    async getCommit(oid) {
        await this.init();

        try {
            const commit = await git.readCommit({
                fs: this.fs,
                dir: this.dir,
                oid: oid
            });

            return {
                oid: commit.oid,
                message: commit.commit.message,
                author: commit.commit.author.name,
                email: commit.commit.author.email,
                timestamp: commit.commit.author.timestamp,
                date: new Date(commit.commit.author.timestamp * 1000),
                tree: commit.commit.tree,
                parent: commit.commit.parent
            };
        } catch (error) {
            console.error('Error obteniendo commit:', error);
            return null;
        }
    }

    // Restaurar el proyecto a un commit específico
    async checkout(oid) {
        await this.init();

        try {
            await git.checkout({
                fs: this.fs,
                dir: this.dir,
                ref: oid
            });

            // Leer el contenido del proyecto
            const content = await this.fs.promises.readFile(
                `${this.dir}/project.json`,
                'utf8'
            );

            return JSON.parse(content);
        } catch (error) {
            console.error('Error haciendo checkout:', error);
            throw error;
        }
    }

    // Obtener diferencias entre dos commits
    async getDiff(oldOid, newOid) {
        await this.init();

        try {
            // Leer contenido de ambos commits
            const oldContent = await this.getFileAtCommit(oldOid, 'project.json');
            const newContent = await this.getFileAtCommit(newOid, 'project.json');

            // Usar diff_match_patch para generar el diff
            const dmp = new diff_match_patch();
            const diffs = dmp.diff_main(oldContent, newContent);
            dmp.diff_cleanupSemantic(diffs);

            return this.formatDiffForDiff2html(diffs, oldOid, newOid);
        } catch (error) {
            console.error('Error generando diff:', error);
            return null;
        }
    }

    // Obtener el contenido de un archivo en un commit específico
    async getFileAtCommit(oid, filepath) {
        await this.init();

        try {
            const { blob } = await git.readBlob({
                fs: this.fs,
                dir: this.dir,
                oid: oid,
                filepath: filepath
            });

            return new TextDecoder().decode(blob);
        } catch (error) {
            console.error('Error leyendo archivo en commit:', error);
            return '';
        }
    }

    // Formatear diff para diff2html
    formatDiffForDiff2html(diffs, oldOid, newOid) {
        let oldLine = 1;
        let newLine = 1;
        let diffText = `--- a/project.json\t${oldOid.substring(0, 7)}\n`;
        diffText += `+++ b/project.json\t${newOid.substring(0, 7)}\n`;
        diffText += '@@ -1,1 +1,1 @@\n';

        for (const [operation, text] of diffs) {
            const lines = text.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (i === lines.length - 1 && line === '') continue;

                if (operation === -1) { // Eliminación
                    diffText += `-${line}\n`;
                    oldLine++;
                } else if (operation === 1) { // Adición
                    diffText += `+${line}\n`;
                    newLine++;
                } else { // Sin cambios
                    diffText += ` ${line}\n`;
                    oldLine++;
                    newLine++;
                }
            }
        }

        return diffText;
    }

    // Crear una rama (para implementar forks)
    async createBranch(branchName, fromRef = 'HEAD') {
        await this.init();

        try {
            await git.branch({
                fs: this.fs,
                dir: this.dir,
                ref: branchName,
                checkout: false,
                force: false
            });

            return true;
        } catch (error) {
            console.error('Error creando rama:', error);
            return false;
        }
    }

    // Listar ramas
    async listBranches() {
        await this.init();

        try {
            const branches = await git.listBranches({
                fs: this.fs,
                dir: this.dir
            });

            return branches;
        } catch (error) {
            // Si no hay commits aún, no hay ramas
            if (error.code === 'NotFoundError' || error.message.includes('Could not find')) {
                return [];
            }
            console.error('Error listando ramas:', error);
            return [];
        }
    }

    // Obtener rama actual
    async getCurrentBranch() {
        await this.init();

        try {
            const branch = await git.currentBranch({
                fs: this.fs,
                dir: this.dir,
                fullname: false
            });

            return branch || 'main';
        } catch (error) {
            // Si no hay commits aún, no hay rama actual
            if (error.code === 'NotFoundError' || error.message.includes('Could not find')) {
                return 'main';
            }
            console.error('Error obteniendo rama actual:', error);
            return 'main';
        }
    }

    // Obtener estadísticas del repositorio
    async getStats() {
        await this.init();

        try {
            const commits = await this.getCommitHistory();
            const branches = await this.listBranches();
            const currentBranch = await this.getCurrentBranch();

            return {
                totalCommits: commits.length,
                totalBranches: branches.length > 0 ? branches.length : 0,
                currentBranch: currentBranch,
                lastCommit: commits[0] || null
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalCommits: 0,
                totalBranches: 0,
                currentBranch: 'main',
                lastCommit: null
            };
        }
    }
}

// Exportar instancia singleton
window.gitService = new GitService();
