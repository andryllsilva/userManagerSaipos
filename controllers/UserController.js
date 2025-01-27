class UserController {

    constructor(formId, tableId) {

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);


        this.submit();
        this.onEditCancel()

    }

    onEditCancel() {
        document.querySelector(".btn-defaut").addEventListener('click', (e) => {
            this.showPanelCreate();
        })
    }


    submit() {

        this.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            let value = this.getValue();

            let btn = this.formEl.querySelector("[type=submit");

            btn.disabled = true;



            if (!value) {
                btn.disabled = false;
                return false;
            }

            this.getPhoto().then(
                (content) => {
                    value.photo = content;
                    this.addLine(value);
                    this.formEl.reset()
                    btn.disabled = false;
                },
                (e) => {
                    console.error(e)
                });

        })
    }


    getPhoto() {

        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {
                if (item.name === "photo") {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            }

            fileReader.onerror = (e) => {
                reject(e)
            }



            if (file) {
                fileReader.readAsDataURL(file)
            } else {
                resolve('dist/profile-user.png')
            }

        })
    }



    getValue() {

        const user = {};
        let isValid = true;


        [...this.formEl.elements].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.name;
                }

            } else if (field.name == "admin") {
                user[field.name] = field.checked;
            } else {

                user[field.name] = field.value;

            }
        });

        if (!isValid) {
            return false;
        } else {
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

    }

    addLine(dataUser) {

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
        
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? "Sim" : "Não"}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        `;

        tr.querySelector(".btn-edit").addEventListener('click', e => {
            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-uptade");

            for (let name in json) {
                let field = form.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    if (field.type == 'file') continue;
                    switch (field.type) {
                        case 'file':
                            continue;
                        case 'radio':
                            field = form.querySelector("[name=" + name.replace("_", "") + "][value" + json[name] + "]")
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];

                    }

                    field.value = json[name];
                }

            }

            this.showPanelUpdate()

        })

        this.tableEl.appendChild(tr);

        this.updateCount();

    }

    showPanelCreate() {
        const boxpost = document.querySelector(".box-success")
        boxpost.style = "display:block"
        const boxput = document.querySelector(".box-primary")
        boxput.style = "display:none"
    }

    showPanelUpdate() {
        const boxpost = document.querySelector(".box-success")
        boxpost.style = "display:none"
        const boxput = document.querySelector(".box-primary")
        boxput.style = "display:block"
    }

    updateCount() {

        let numberUser = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr => {
            numberUser++;
            let users = JSON.parse(tr.dataset.user);
            if (users._admin) {
                numberAdmin++
            }
        })

        document.querySelector('#number-User').innerHTML = numberUser;
        document.querySelector('#number-Admin').innerHTML = numberAdmin
    }

}