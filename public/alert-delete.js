document.querySelector("#form-delete")
.addEventListener("submit", function (event) {
  const currentPage  = window.location.pathname

  let messageConfirmation = {
    products: "Deseja Deletar este Produto?",
    users: "Tem certeza que deseja excluir sua conta? Essa operação não poderá ser desfeita!"
  }

  let confirmation = null

  if (currentPage.includes("users")) {
    confirmation = confirm(messageConfirmation.users)
  } else {
    confirmation = confirm(messageConfirmation.products)
  }
  
  if (!confirmation) 
    event.preventDefault()
})