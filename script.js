function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

const LANDMARKS = {
  leftTemple: 234,
  rightTemple: 454,
  chin: 152,
  forehead: 10,
  leftEye: 33,
  rightEye: 263,
  leftJaw: 234,
  rightJaw: 454,
  pupilLeft: 468,
  pupilRight: 473,
  noseLeft: 168,
  noseRight: 197,
  browTop: 151,
  browLeftEdge: 127,
  browRightEdge: 356
};

function onResults(results) {
  const landmarks = results.multiFaceLandmarks[0];
  if (!landmarks) return;

  const latimeFata = distance(landmarks[LANDMARKS.leftTemple], landmarks[LANDMARKS.rightTemple]);
  const inaltimeFata = distance(landmarks[LANDMARKS.forehead], landmarks[LANDMARKS.chin]);
  const distOchi = distance(landmarks[LANDMARKS.leftEye], landmarks[LANDMARKS.rightEye]);
  const latimeBarbie = distance(landmarks[LANDMARKS.leftJaw], landmarks[LANDMARKS.rightJaw]);
  const interpupilara = distance(landmarks[LANDMARKS.pupilLeft], landmarks[LANDMARKS.pupilRight]);
  const latimeNas = distance(landmarks[LANDMARKS.noseLeft], landmarks[LANDMARKS.noseRight]);
  const inaltimeFrunte = distance(landmarks[LANDMARKS.forehead], landmarks[LANDMARKS.browTop]);
  const latimeSprancene = distance(landmarks[LANDMARKS.browLeftEdge], landmarks[LANDMARKS.browRightEdge]);
  const raport = latimeFata / inaltimeFata;

  let formaFetei = "-";
  if (raport > 1.1) formaFetei = "Rotundă";
  else if (raport < 0.85) formaFetei = "Alungită";
  else formaFetei = "Ovală";

  document.getElementById("detected-shape").textContent = `Formă detectată: ${formaFetei}`;
  document.getElementById("formaFetei").value = formaFetei;
  document.getElementById("latimeFata").value = latimeFata.toFixed(2);
  document.getElementById("inaltimeFata").value = inaltimeFata.toFixed(2);
  document.getElementById("distOchi").value = distOchi.toFixed(2);
  document.getElementById("latimeBarbie").value = latimeBarbie.toFixed(2);
  document.getElementById("raport").value = raport.toFixed(2);
  document.getElementById("interpupilara").value = interpupilara.toFixed(2);
  document.getElementById("latimeNas").value = latimeNas.toFixed(2);
  document.getElementById("inaltimeFrunte").value = inaltimeFrunte.toFixed(2);
  document.getElementById("latimeSprancene").value = latimeSprancene.toFixed(2);
}

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5
});
faceMesh.onResults(onResults);

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});
camera.start();

async function trimitePrompt() {
  const payload = {
    formaFetei: document.getElementById("formaFetei").value,
    genul: document.getElementById("genul").value,
    stilul: document.getElementById("stilul").value,
    latimeFata: document.getElementById("latimeFata").value,
    inaltimeFata: document.getElementById("inaltimeFata").value,
    distOchi: document.getElementById("distOchi").value,
    latimeBarbie: document.getElementById("latimeBarbie").value,
    raport: document.getElementById("raport").value,
    interpupilara: document.getElementById("interpupilara").value,
    latimeNas: document.getElementById("latimeNas").value,
    inaltimeFrunte: document.getElementById("inaltimeFrunte").value,
    latimeSprancene: document.getElementById("latimeSprancene").value
  };

  const raspunsEl = document.getElementById("raspunsGPT");
  raspunsEl.innerText = "Se generează recomandarea...";

  try {
   const response = await fetch("https://rame-ai-backend.vercel.app/api/recomanda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    raspunsEl.innerText = data.raspuns || "Eroare: nu s-a primit un răspuns valid.";
  } catch (error) {
    raspunsEl.innerText = "Eroare la generarea recomandării.";
    console.error(error);
  }
}
