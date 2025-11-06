from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='/tmp/cert.pem', keyfile='/tmp/key.pem')
context.check_hostname = False

with HTTPServer(("localhost", 4443), SimpleHTTPRequestHandler) as httpd:
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    httpd.serve_forever()