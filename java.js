function entrar() {
  document.getElementById("tela-inicial").style.display = "none";
  document.getElementById("feed").style.display = "block";
}

function curtir(btn) {
  let span = btn.querySelector("span");
  let num = parseInt(span.innerText);
  span.innerText = num + 1;
}

function comentar() {
  alert("Função de comentar ainda em desenvolvimento!");
}

function novoPost() {
  alert("Aqui você poderia criar um novo post!");
}
