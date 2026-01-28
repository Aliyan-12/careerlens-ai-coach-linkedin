document.getElementById("analyze").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const profileData = await chrome.tabs.sendMessage(tab.id, {
    type: "SCRAPE_PROFILE"
  });

  console.log();
  const response = await chrome.runtime.sendMessage({
    type: "ANALYZE_WITH_GEMINI",
    payload: profileData
  });

  console.log(response.result);
  document.getElementById("output").textContent = response.result;
};
