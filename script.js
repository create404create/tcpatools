const API_KEY = "cbee2905-8e42-4548-875a-392a28c0404e";

document.getElementById("checkBtn").addEventListener("click", async () => {
  const number = document.getElementById("numberInput").value.trim();
  const loader = document.getElementById("loader");
  const result = document.getElementById("result");

  if (!number) {
    alert("Please enter a phone number!");
    return;
  }

  loader.style.display = "block";
  result.textContent = "Fetching data...";

  try {
    const url = `https://tcpa.api.uspeoplesearch.net/tcpa/v1?x=${API_KEY}&number=${number}`;
    const res = await fetch(url);
    const data = await res.json();

    loader.style.display = "none";
    result.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    loader.style.display = "none";
    result.textContent = "Error fetching data: " + err.message;
  }
});
