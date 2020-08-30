document.querySelector("#form-delete")
.addEventListener("submit", function (event) {
  const confirmation = confirm('Deseja Deletar?')
  if (!confirmation) 
    event.preventDefault()
})