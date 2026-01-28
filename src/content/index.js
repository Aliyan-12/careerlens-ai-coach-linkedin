// function getText(selector) {
//   const el = document.querySelector(selector);
//   return el ? el.innerText.trim() : "";
// }

function getSectionHTML(selector) {
  const el = document.querySelector(selector);
  return el ? el.outerHTML : "";
}

function scrapeProfile() {
  return {
    // headline: getSectionHTML("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUTopcard']"),
    // aboutSection: getSectionHTML("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUAbout']"),
    // experienceSection: getSectionHTML("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUExperienceTopLevelSection']"),
    headline: getSectionHTML("section[componentkey*='profile.card'][componentkey*='Topcard']"),
    aboutSection: getSectionHTML("section[componentkey*='profile.card'][componentkey*='About']"),
    experienceSection: getSectionHTML("section[componentkey$='ExperienceTopLevelSection']"),
    url: window.location.href
  };
}

// function scrapeProfile() {
//   return {
//     name: getText("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUTopcard'] h2.d6702861"), // componentkey="com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUTopcard"
//     headline: getText("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUAbout'] p.d6702861"), 
//     about: getText("section[componentkey='com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUAbout'] p[data-testid='expandable-text-box']"), // componentkey="com.linkedin.sdui.profile.card.refACoAADqNqd8BdT_a7PUftpAiS3e6g7_geH_sUkUAbout"
//     url: window.location.href
//   };
// }

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCRAPE_PROFILE") {
    const profileData = scrapeProfile();
    console.log(profileData);
    sendResponse(profileData);
  }
});
