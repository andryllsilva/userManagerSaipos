class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);


        this.submit();
        this.onEdit();
        this.selectAll();

    }

    onEdit() {
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let value = this.getValue(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, value)



            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!value.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result)
                    
                    this.getTr(user, tr);

                    this.addEventsTr(tr);
                    this.updateCount();

                    this.formUpdateEl.reset();
                    btn.disabled = false;
                    this.showPanelCreate();
                },
                (e) => {
                    console.error(e)
                });


        })
    }


    submit() {

        this.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            let value = this.getValue(this.formEl);

            let btn = this.formEl.querySelector("[type=submit");

            btn.disabled = true;



            if (!value) {
                btn.disabled = false;
                return false;
            }

            this.getPhoto(this.formEl).then(
                (content) => {
                    value.photo = content;

                    this.insert(value)
                    this.addLine(value);
                    this.formEl.reset()
                    btn.disabled = false;
                },
                (e) => {
                    console.error(e)
                });

        })
    }


    getPhoto(formEl) {

        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
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



    getValue(formEl) {

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            if (field.name == "gender") {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if (field.name == "admin") {

                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;

            }

        });

        if (!isValid) {
            return false;
        }

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

    getUsersStorage(){
        let users = [];
        
        if(localStorage.getItem('users')){

            users = JSON.parse(localStorage.getItem('users'))

        }

        return users
    }

    selectAll(){
        let users = this.getUsersStorage()

        users.forEach(dataUser =>{

            let user = new User();

            user.loadFromJSON(dataUser)
            this.addLine(user);
        })
    }

    insert(data){

        let users = this.getUsersStorage()

        users.push(data);


        //sessionStorage.setItem("users",JSON.stringify(users));

        localStorage.setItem("users",JSON.stringify(users));
    }

    getTr(dataUser, tr = null){
       if(tr === null) tr = document.createElement('tr');

       tr.dataset.user = JSON.stringify(dataUser);
        
        tr.innerHTML = `
        
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? "Sim" : "Não"}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr)

        return tr
    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        tr.dataset.user = JSON.stringify(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();

    }

    addEventsTr(tr) {
        tr.querySelector(".btn-delete").addEventListener('click', e => {
            if(confirm("Deseja realmente excluir???")){
               tr.remove(); 
               this.updateCount();
            }
        }), 

        tr.querySelector(".btn-edit").addEventListener('click', e => {
            let json = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

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
            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate()
        });
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

        let numberUsers = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr => {
            numberUsers++;
            let users = JSON.parse(tr.dataset.user);
            if (users._admin) {
                numberAdmin++
            }
        })

        document.querySelector('#number-users').innerHTML = numberUsers;
        document.querySelector('#number-users-admin').innerHTML = numberAdmin
    }

}