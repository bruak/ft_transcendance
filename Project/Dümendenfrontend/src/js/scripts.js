// Bu dosya, web sayfasındaki etkileşimli işlevsellik için JavaScript kodunu içerecektir. 
// Şu anda herhangi bir işlevsellik eklenmemiştir.
let sayac = document.getElementById("sayac");
let arti = document.getElementById("arti");
let eksi = document.getElementById("eksi");
let reset = document.getElementById("reset");

let sayi = 0;

arti.addEventListener("click", () => {
  sayi++;
  sayac.textContent = sayi;
});

eksi.addEventListener("click", () => {
  sayi--;
  sayac.textContent = sayi;
});

reset.addEventListener("click", () => {
  sayi = 0;
  sayac.textContent = sayi;
});


let ekleBtn = document.getElementById("ekle");
let yeniUrunInput = document.getElementById("yeniUrun");
let liste = document.getElementById("liste");

ekleBtn.addEventListener("click", () => {
  let urun = yeniUrunInput.value;
  if (urun.trim() === "") {
    alert("Ürün adı boş olamaz!");
    return;
  }

  let li = document.createElement("li");
  li.textContent = urun;

  let silBtn = document.createElement("button");
  silBtn.textContent = "Sil";
  silBtn.style.marginLeft = "10px";

  silBtn.addEventListener("click", () => {
    liste.removeChild(li);
  });

  li.appendChild(silBtn);
  liste.appendChild(li);

  yeniUrunInput.value = ""; // Input'u temizle
});
