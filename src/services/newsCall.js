// const SERVER_URL = 'http://192.168.215.193:5001';
// const SERVER_URL = 'http://192.168.186.193:5001';
const SERVER_URL = 'http://10.0.2.2:5001';
export const submitText = async(text) => {
 try {
   const response = await fetch(`${SERVER_URL}/text`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({text}),
   });

   const data = await response.json();

   if (!response.ok) {
     throw new Error(data.message || 'Submission failed');
   }

   return {
     text: data.text || '',
     matchedArticles: data.matched_articles || [],
     prediction: data.prediction || '',
     score: data.score || 0,
     matchedArticleScore: data.total_ave_rounded || 0,
   };
 } catch (error) {
   throw error;
 }
};


export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });


    const response = await fetch(`${SERVER_URL}/news`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error from Flask API:', errorDetails);
      throw new Error('Failed to upload image');
    }

    const data = await response.json();


    return {
      extracted_text: data.extracted_text || '',
      face_recognition: data.face_recognition || 'No Face Detected',
      cleanedText: data.cleaned_text || '',
      matchedArticles: data.matched_articles || [],
      // sourceCredibility: data.source_credibility || '',
      prediction: data.prediction || '',
      score: data.score || '',
      sourceName: data.source_name || '',
      matchedPerson: data.match_person || '',
      sourceScore: data.source_score || 0,
      matchedArticleScore: data.total_ave_rounded || 0,
    };
  } catch (error) {
    console.error('❌ Error extracting text:', error);
    return {
      extracted_text: '',
      face_recognition: 'No Face Detected',
    };
  }
};
