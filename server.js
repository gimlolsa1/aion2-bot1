const express = require("express");
const axios = require("axios");

const app = express();

app.get("/search", async (req, res) => {
    try {

        let name = req.query.name;

        let url =
        "https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character"
        + "?keyword=" + encodeURIComponent(name)
        + "&page=1&size=10";

        let result = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://aion2.plaync.com/"
            }
        });

        res.json(result.data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

app.get("/info", async (req, res) => {
    try {

        let id = req.query.id;

        let url =
        "https://aion2.plaync.com/api/character/info"
        + "?lang=ko"
        + "&characterId=" + encodeURIComponent(id);

        let result = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        res.json(result.data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
