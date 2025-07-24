function fechar() {
  document.querySelector('.wrapper').classList.remove('active-popup');
}

document.getElementById('formContato').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Mensagem enviada com sucesso!');
  this.reset();
});
