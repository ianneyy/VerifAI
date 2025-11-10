/* eslint-disable no-undef */
// const SERVER_URL = 'http://192.168.215.193:5001';
const SERVER_URL = 'http://10.121.34.193:5001';
  // const SERVER_URL = 'https://ovx7-verifai.hf.space';
  const TEXT_URL = 'https://verifai-text-service.onrender.com';
const IMAGE_URL = 'https://ovx7-image-service.hf.space';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import EventSource from 'react-native-sse';
// const getServerUrl = async () => {
//   const isEmulator = await DeviceInfo.isEmulator();

//   if (Platform.OS === 'android' && isEmulator) {
//     return 'http://10.0.2.2:5001';
//   } else {
//     return 'http://192.168.1.7:5001'; // <-- your laptop's real IP address
//   }
// };

// const SERVER_URL = 'http://10.0.2.2:5001';
export const submitTextWithProgress = async (text, onProgress, onComplete, onError) => {
  const url = `${SERVER_URL}/text`;
  const es = new EventSource(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  es.addEventListener('message', event => {
    try {
      const data = JSON.parse(event.data);
      if (data.complete) {
        onComplete(data.result);
        es.close();
      } else {
        onProgress(data.progress / 100, data.message);
      }
    } catch (err) {
      console.log('Parse error:', err);
    }
  });

  es.addEventListener('error', err => {
    es.close();
    onError(err);
  });
};

// export const uploadImage = async imageUri => {
//   // const SERVER_URL = await getServerUrl();

//   try {
//     const formData = new FormData();
//     formData.append('image', {
//       uri: imageUri,
//       name: 'upload.jpg',
//       type: 'image/jpeg',
//     });

//     const response = await fetch(`${SERVER_URL}/news`, {
//       method: 'POST',
//       body: formData,
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     if (!response.ok) {
//       const errorDetails = await response.text();
//       console.error('Error from Flask API:', errorDetails);
//       throw new Error('Failed to upload image');
//     }

//     const data = await response.json();

//     return {
//       extracted_text: data.extracted_text || '',
//       face_recognition: data.face_recognition || 'No Face Detected',
//       cleanedText: data.cleaned_text || '',
//       matchedArticles: data.matched_articles || [],
//       // sourceCredibility: data.source_credibility || '',
//       prediction: data.prediction || '',
//       score: data.score || '',
//       sourceName: data.source_name || '',
//       matchedPerson: data.match_person || '',
//       sourceScore: data.source_score || 0,
//       matchedArticleScore: data.total_ave_rounded || 0,
//     };
//   } catch (error) {
//     console.error('❌ Error extracting text:', error);
//     return {
//       extracted_text: '',
//       face_recognition: 'No Face Detected',
//     };
//   }
// };


// export const submitUrl = async url => {
//   // const SERVER_URL = await getServerUrl();

//   try {
//     const response = await fetch(`${SERVER_URL}/url`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({url}),
//     });

//     const data = await response.json();
//     console.log('Response from Flask API:', data);
   
  
//     return {
//       sourceName: data.source_name || '',
//       title: data.title || '',
//       description: data.description || '',
//       date: data.date || '',
//       url: data.link || '',
//       author: data.author || '',
//       thumbnail: data.thumbnail || '',

//       face_recognition: data.face_recognition || 'No Face Detected',
//       matchedArticles: data.matched_articles || [],
//       prediction: data.prediction || '',
//       score: data.score || '',
//       matchedPerson: data.match_person || '',
//       sourceScore: data.source_score || 0,
//       matchedArticleScore: data.total_ave_rounded || 0,
//     };
    
//   } catch (error) {
//     throw error;
//   }
// };

export const submitUrlWithProgress = (url, onProgress, onComplete, onError) => {
  try {
    const es = new EventSource(`${SERVER_URL}/url`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url}),
    });

    es.addEventListener('message', event => {
      try {
        const data = JSON.parse(event.data);

        if (data.complete) {
          onComplete && onComplete(data.result);
          es.close();
        } else {
          onProgress && onProgress(data.progress / 100, data.message);
        }
      } catch (err) {
        console.log('Parse error:', err);
      }
    });

    es.addEventListener('error', err => {
      es.close();
      onError && onError(err);
    });
  } catch (err) {
    onError && onError(err);
  }
};




export const uploadImageWithProgress = (
  imageUri,
  onProgress,
  onComplete,
  onError,
) => {
  const readFileAsBase64 = async uri => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      fetch(uri)
        .then(res => res.blob())
        .then(blob => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]); // get base64 string
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  readFileAsBase64(imageUri)
    .then(base64Image => {
      try {
        const es = new EventSource(`${SERVER_URL}/news`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({image: base64Image}), // send in POST body, not URL
        });

        es.addEventListener('message', event => {
          try {
            const data = JSON.parse(event.data);

            if (data.complete) {
              onComplete && onComplete(data.result);
              es.close();
            } else {
              onProgress && onProgress(data.progress / 100, data.message);
            }
          } catch (err) {
            console.log('Parse error:', err);
          }
        });

        es.addEventListener('error', err => {
          es.close();
          onError && onError(err);
        });
      } catch (err) {
        onError && onError(err);
      }
    })
    .catch(err => {
      console.error('Error reading image:', err);
      onError && onError(err);
    });
};
