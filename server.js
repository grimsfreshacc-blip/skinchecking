import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        // Exchange auth code for Fortnite access token
        const tokenReq = await fetch("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "basic ZWNlNzgyY2Y2ZjRmNDJlZmI4YjFkZDhiOTg5NTMxZjE6YTc4ZjcyYjUtZjkwYi00YmM3LWIyY2MtZTVlYTc0MmZkODI0"
            },
            body: `grant_type=authorization_code&code=${code}`
        });

        const tokenData = await tokenReq.json();
        if (!tokenData.access_token) {
            return res.status(400).json({ error: "Invalid code" });
        }

        // Fetch Fortnite locker
        const profileReq = await fetch("https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/account/" + tokenData.account_id + "/client/QueryProfile?profileId=athena&rvn=-1", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const profileData = await profileReq.json();

        res.json({
            account: {
                username: tokenData.displayName,
                id: tokenData.account_id
            },
            profile: profileData
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3000, () => console.log("SkinChecker API running"));
