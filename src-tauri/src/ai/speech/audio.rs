use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

pub struct AudioCapture {
    pub sample_rate: f32,
    #[allow(dead_code)]
    pub channels: u16,
}

pub fn create_audio_stream(
    running: Arc<AtomicBool>,
    tx: std::sync::mpsc::Sender<Vec<i16>>,
) -> Result<(cpal::Stream, AudioCapture), String> {
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or("No input device available")?;

    let config = device.default_input_config().map_err(|e| e.to_string())?;
    let sample_rate = config.sample_rate().0 as f32;
    let channels = config.channels();

    let err_fn = |err| eprintln!("Stream error: {}", err);

    let stream = match config.sample_format() {
        cpal::SampleFormat::I16 => {
            let tx = tx.clone();
            let running = running.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &_| {
                    if !running.load(Ordering::Relaxed) {
                        return;
                    }
                    let mono_data: Vec<i16> = if channels == 2 {
                        data.chunks(2)
                            .map(|c| c[0].wrapping_add(c[1]) / 2)
                            .collect()
                    } else {
                        data.to_vec()
                    };
                    let _ = tx.send(mono_data);
                },
                err_fn,
                None,
            )
        }
        cpal::SampleFormat::F32 => {
            let tx = tx.clone();
            let running = running.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &_| {
                    if !running.load(Ordering::Relaxed) {
                        return;
                    }
                    let mono_data: Vec<i16> = if channels == 2 {
                        data.chunks(2)
                            .map(|c| {
                                let v = (c[0] + c[1]) / 2.0;
                                (v * 32767.0) as i16
                            })
                            .collect()
                    } else {
                        data.iter().map(|&v| (v * 32767.0) as i16).collect()
                    };
                    let _ = tx.send(mono_data);
                },
                err_fn,
                None,
            )
        }
        _ => return Err("Unsupported sample format".into()),
    }
    .map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    Ok((stream, AudioCapture { sample_rate, channels }))
}
