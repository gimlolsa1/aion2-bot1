const express = require("express");
const axios = require("axios");

const app = express();

/* =========================
   🔍 캐릭터 검색
========================= */
app.get("/search", async (req, res) => {

    try {

        let name = req.query.name;

        let url =
        "https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character"
        + "?keyword=" + encodeURIComponent(name)
        + "&page=1&size=30";

        let result = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://aion2.plaync.com/",
                "Accept": "application/json"
            }
        });

        // 이름 정리
        let data = result.data;

        if (data.list) {
            data.list = data.list.map(c => ({
                ...c,
                name: c.name.replace(/<[^>]*>/g, "")
            }));
        }

        res.json(data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});


/* =========================
   ⚔ 전투력 (최종 안정 버전)
========================= */
app.get("/power", async (req, res) => {

    try {

        let name = req.query.name;

        // 1️⃣ 검색
        let search = await axios.get(
            "https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character",
            {
                params: {
                    keyword: name,
                    page: 1,
                    size: 10
                },
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://aion2.plaync.com/"
                }
            }
        );

        let char = search.data.list?.[0];

        if (!char) {
            return res.json({ error: "캐릭터 없음" });
        }

        // 2️⃣ info API
        let info = await axios.get(
            "https://aion2.plaync.com/api/character/info",
            {
                params: {
                    lang: "ko",
                    characterId: char.characterId,
                    serverId: char.serverId
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://aion2.plaync.com/ko-kr/characters/index",
                    "Origin": "https://aion2.plaync.com",
                    "Accept": "application/json"
                }
            }
        );

        let data = info.data;

        // 🔥 무조건 다 뒤진다 (완전 안전 추출)
        let power =
            data?.combatPower ||
            data?.data?.combatPower ||
            data?.character?.combatPower ||
            data?.result?.combatPower ||
            data?.summary?.combatPower ||
            data?.stats?.combatPower ||
            null;

        res.json({
            name: char.name.replace(/<[^>]*>/g, ""),
            server: char.serverName,
            combatPower: power || "정보 없음"
        });

    } catch (e) {
        res.json({ error: e.toString() });
    }
});


/* =========================
   🚀 서버 실행
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
