ffmpeg -i %1 -c:a libopus -b:a 320k -vn -f webm -dash 1 audio%2.opus
ffmpeg -i audio%2.opus -c:a libopus -b:a 320k -vn -f webm -dash 1 audio_320k%2.webm
ffmpeg -i audio%2.opus -c:a libopus -b:a 256k -vn -f webm -dash 1 audio_256k%2.webm
ffmpeg -i audio%2.opus -c:a libopus -b:a 128k -vn -f webm -dash 1 audio_128k%2.webm
ffmpeg -i audio%2.opus -ss 00:00:10 -to 00:00:20 -c copy audio_review%2.webm
packager ^
  in=audio_320k%2.webm,stream=audio,output=audio_320k_e%2.webm,drm_label=AUDIO ^
  in=audio_256k%2.webm,stream=audio,output=audio_256k_e%2.webm,drm_label=AUDIO ^
  in=audio_128k%2.webm,stream=audio,output=audio_128k_e%2.webm,drm_label=AUDIO ^
  --enable_raw_key_encryption ^
  --keys label=AUDIO:key_id=f3c5e0361e6654b28f8049c778b23946:key=a4631a153a443df9eed0593043db7519