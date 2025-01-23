class UserController {
  constructor(formId, tableId) {

      this.formEl = document.getElementById(formId);
      this.tableEl = document.getElementById(tableId);
      
      // chamando o metodo ao instanciar o UserController
      this.submit()

  }
  submit(){

      this.formEl.addEventListener("submit", (event) => {
          event.preventDefault();
          this.addLine(this.getValue());
      
      })
  }

   
  getValue() {

      const user = {};

      [...this.formEl.elements].forEach(function (field, index) {
          if (field.name == "gender") {
              if (field.checked === true) { // ou apenas field.checked
                  user[field.name] = field.name;
              }

          } else {

              user[field.name] = field.value;

          }
      });

      return new User(
          user.name,
          user.gender,
          user.birth,
          user.country,
          user.email,
          user.password,
          user.photo,
          user.admin
      );

  }

  addLine(dataUser, tableId) {

      this.tableEl.innerHTML = `
      <tr>
          <td><img src="dist/img/user1-128x128.jpg" alt="User Image" class="img-circle img-sm"></td>
          <td>${dataUser.name}</td>
          <td>${dataUser.email}</td>
          <td>${dataUser.admin}</td>
          <td>${dataUser.birth}</td>
          <td>
              <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
              <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
          </td>
      </tr>`;
  
  }

}