import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import "dotenv/config";
import cors from "cors"; // ✅ Adăugat

const app = express();
const port = 3000;

// ✅ Permite requesturi doar de la Vercel
app.use(cors({
  origin: "https://rame-ai-frontend.vercel.app"
}));

app.use(bodyParser.json());
app.use(express.static(".")); // Servește fișierele HTML, CSS, JS

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/recomanda", async (req, res) => {
  const {
    formaFetei, genul, stilul,
    latimeFata, inaltimeFata, distOchi,
    latimeBarbie, raport, interpupilara,
    latimeNas, inaltimeFrunte, latimeSprancene,
  } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // sau "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: `Ești un consultant profesionist în alegerea ramelor de ochelari, expert în interpretarea trăsăturilor faciale și proporțiilor. Răspunsurile tale trebuie să fie clare, personalizate și profesioniste, adaptate fiecărui client.`
        },
        {
          role: "user",
          content: `
Clientul are următorul profil:
- Formă față: ${formaFetei}
- Gen: ${genul}
- Stil preferat: ${stilul}
- Lățime față: ${latimeFata}
- Înălțime față: ${inaltimeFata}
- Raport lățime/înălțime: ${raport}
- Lățime bărbie: ${latimeBarbie}
- Distanță între ochi: ${distOchi}
- Distanță interpupilară: ${interpupilara}
- Lățime nas: ${latimeNas}
- Înălțime frunte: ${inaltimeFrunte}
- Lățime sprâncene: ${latimeSprancene}

Pe baza acestor trăsături, oferă o recomandare profesionistă în 3–5 fraze despre ce tip de rame de ochelari i se potrivesc cel mai bine. Argumentează alegerea ținând cont de proporții, stil și gen.
`
        }
      ],
      temperature: 0.7
    });

    const mesaj = completion.choices?.[0]?.message?.content || "Nu s-a primit un răspuns.";
    res.json({ raspuns: mesaj });

  } catch (error) {
    console.error("Eroare GPT:", error.response?.data || error.message);
    res.status(500).json({ raspuns: "Eroare: nu s-a primit un răspuns valid." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
