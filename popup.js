const possibleHeaders = ["X-Forwarded-For", "Client-Ip", "Via", "X-Real-IP"];

function parseIp(base) {
    let ip = [];
    ip[0] = parseInt(document.getElementById(base + "a").value);
    ip[1] = parseInt(document.getElementById(base + "b").value);
    ip[2] = parseInt(document.getElementById(base + "c").value);
    ip[3] = parseInt(document.getElementById(base + "d").value);
    console.log("read: " + ip);
    return ip;
}

function fillIp(ip, base) {
    document.getElementById(base + "a").value = ip[0];
    document.getElementById(base + "b").value = ip[1];
    document.getElementById(base + "c").value = ip[2];
    document.getElementById(base + "d").value = ip[3];
}

async function fillSettingsForm() {
    try {
        let g = await browser.storage.local.get(["enabled", "headers", "behaviour", "range_from", "range_to", "list",
            "whitelist", "sync"]);
        document.getElementById("enabled").checked = g.enabled;
        checkFormEnabled();

        for (let header in possibleHeaders) {
            document.getElementById("header-" + possibleHeaders[header]).checked =
                g.headers.includes(possibleHeaders[header]);
        }

        if (g.behaviour === "range") {
            document.getElementById("b-rad-range").checked = true;
        } else {
            document.getElementById("b-rad-list").checked = true;
        }

        fillIp(g.range_from, "ip-range-from-");
        fillIp(g.range_to, "ip-range-to-");

        document.getElementById("ip-list").value = g.list.join("\n");
        document.getElementById("whitelist").value = g.whitelist.join("\n");

        document.getElementById("behaviour-sync-ips").checked = g.sync
    } catch (e) {
        console.log(e);
        console.log("resetting config");
        await resetConfig();
    }
}

async function submitSettings() {
    await browser.storage.local.set({
        headers: possibleHeaders.filter(h => document.getElementById("header-" + h).checked),
        enabled: document.getElementById("enabled").checked,
        behaviour: document.getElementById("b-rad-range").checked ? "range" : "list",
        range_from: parseIp("ip-range-from-"),
        range_to: parseIp("ip-range-to-"),
        list: document.getElementById("ip-list").value.trim().split("\n"),
        sync: document.getElementById("behaviour-sync-ips").checked,
        whitelist: document.getElementById("whitelist").value.trim().split("\n")
    });
    document.getElementById("status").innerHTML = "saved.";

    return false;
}

function checkFormEnabled() {
    let d = document.getElementById("enabled");
    let fieldsets = document.getElementsByTagName("fieldset");
    for (let f in fieldsets) {
        fieldsets[f].disabled = !d.checked;
    }
}

async function resetConfig() {
    await browser.storage.local.set({
        headers: ["X-Forwarded-For"],
        enabled: false,
        behaviour: "range",
        range_from: [0, 0, 0, 0],
        range_to: [255, 255, 255, 255],
        list: ["127.0.0.1", "192.168.1.1", "0.0.0.0"],
        sync: true,
        whitelist: ["http://ignore_this_domain\\.tld/.*"]
    });
    await fillSettingsForm();
    await checkFormEnabled();
}

document.getElementById("enabled").onclick = checkFormEnabled;
document.getElementById("form").onsubmit = submitSettings;
document.getElementById("reset-config").onclick = resetConfig;

fillSettingsForm();
