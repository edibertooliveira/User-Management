class UserController {

  //Seletor de todos os formularios
  //Seletor que recebe novo elemento 'TR'
  //Função submit do formulario
  constructor(formIdUpdate,formIdCreate, targetID, userNumber, adminNumber){
    this.formElementUpdate = document.getElementById(formIdUpdate);
    this.formElementCreate = document.getElementById(formIdCreate);
    this.formTarget = document.getElementById(targetID);
    this._userNumber = document.getElementById(userNumber);
    this._adminNumber = document.getElementById(adminNumber);
    this.onSubmit();
    this.onClickCancel()
  }

  // SAI DA TELA DE EDIÇÃO USER

  onClickCancel(){
    document.querySelector('#box-user-update .btn-default').addEventListener('click', e=> {
      this.outInputBoxUpdate();

    });


    this.formElementUpdate.addEventListener('submit', (event)=>{

      event.preventDefault();
      
      let btn = this.formElementUpdate.querySelector('[type=submit]');
      btn.disabled = true;

      let value = this.getValue(this.formElementUpdate);
      let userOld = JSON.parse(tr.dataset.user);
      console.log(userOld);
      let result = Object.assign();
      // 
      let index = this.formElementUpdate.dataset.trIndex
      console.log(index, 'index');

      let tr = this.formTarget.rows[index];
      console.log(tr, 'tr');
      tr.dataset.user = JSON.stringify(value);

      tr.innerHTML =
        `<tr>
          <td><img src="${value.photo}" alt="User Image" class="img-circle img-sm"></td>
          <td>${value.name}</td>
          <td>${value.email}</td>
          <td>${(value.admin) ? 'Sim' : 'Não'}</td>
          <td>${Utils.dateFormat(value.register)}</td>
          <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-excluir btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;
      this.addEventsTr(tr);
      this.updateCount();
     
  });

  }//!onClickCancel


  //QUANDO FOR APERTADO O BUTÃO DE 'SUBMIT'
  //NÃO ATUALIZA A TELA
  //ADD TR COM INFORMAÇÕES DA CLASS USER
  onSubmit(){

    this.formElementCreate.addEventListener('submit',event =>{
      //Não permite atualização da pagina quando leva submit
      event.preventDefault();

      //Seleciona o botão submit
      //Status do submit ativado
      let btn = this.formElementCreate.querySelector('[type=submit]');
      btn.disabled = true;


      let value = this.getValue(this.formElementCreate);

      //canceled send form
      if (!value) return false;
      
      this.getPhoto().then(
        (content)=>{
          value.photo = content;
          this.addLine(value);
          this.formElementCreate.reset();
          btn.disabled = false;
        },
        (e)=>{
          console.error(e)
        }
      );
      
    });
  }//!onSubmit


  getPhoto(){
    //PROMISE PARA QUANDO DÊ CERTOU OU ERRADO
    return new Promise((resolve, reject)=>{

      let fileReader = new FileReader();

      let elements = [...this.formElementCreate.elements].filter(item=>{
  
        if(item.name === 'photo'){
          return item;
        }
      });

      let file = elements[0].files[0];

      fileReader.onload = () =>{
        resolve(fileReader.result);
      };

      fileReader.onerror = (e) =>{
        reject(e)
      }
      if(file){

        fileReader.readAsDataURL(file);
      }else{
        resolve('dist/img/boxed-bg.jpg');
      }

    });
  }//!getPhoto


  //ADD TAG TR DENTRO DA PAGE COM INFORMAÇÕES DOS FORMULARIOS
  addLine(dataUser){
    let tr = document.createElement('tr');

    //Guardar informações no dataset API
    tr.dataset.user = JSON.stringify(dataUser);

    tr.innerHTML =
    `<tr>
      <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
      <td>${dataUser.name}</td>
      <td>${dataUser.email}</td>
      <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
      <td>${Utils.dateFormat(dataUser.register)}</td>
      <td>
        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
        <button type="button" class="btn btn-danger btn-excluir btn-xs btn-flat">Excluir</button>
        </td>
    </tr>
    `;
   
    this.addEventsTr(tr);
    this.formTarget.appendChild(tr);
    this.updateCount();
  }//!addLine

addEventsTr(tr){
   // PEGA O 'TR' QUE DEVE SER ALTERADO
   tr.querySelector('.btn-edit').addEventListener('click', e=> {
    let json = JSON.parse(tr.dataset.user);  
    this.formElementUpdate.dataset.trIndex = tr.sectionRowIndex;
    
    //FOR IN LAÇO PARA PERCORRER OBJETO
    //REPLECE SUBSTITUI '_' POR '' NADA
    for(let name in json){
      let field = this.formElementUpdate.querySelector("[name=" + name.replace("_","") + "]");


      if(field) {

        // FILTRO PARA CADA AÇÃO ESPECIFICA
        switch (field.type) {
          case 'file':
            continue;
            break;

          case 'radio':
            field = this.formElementUpdate.querySelector("[name=" + name.replace("_","") + "][value=" + json[name]+"]");
            field.checked = true;
            break;

          case 'checkbox':
            field.checked = json[name];
            break;

          default:
            field.value = json[name]; 
        }
      }
    }
    
    this.formElementUpdate.querySelector('.photo').src = json._photo;
    this.inputBoxUpdate();

  });
}

  inputBoxUpdate(){
      document.querySelector('#box-user-create').style.display ="none";
      document.querySelector('#box-user-update').style.display ="block";
    
  }//!inputBoxUpdate

  outInputBoxUpdate(){
    document.querySelector('#box-user-create').style.display ="block";
    document.querySelector('#box-user-update').style.display ="none";
  }//!outInputBoxUpdate

  
  
   //Calcula o total de user e admim
  updateCount(){

  // salva array do for
    let userNumber = 0;
    let adminNumber = 0;

  // passa pelo Array, consultado se contem 'TR' 
    [...this.formTarget.children].forEach(tr=>{

      // consulta se é usuario ou admin
      let user = JSON.parse(tr.dataset.user);

      //Se for Admin somar +1
      if (user._admin) adminNumber++;
      userNumber++;

    });

    this._userNumber.innerHTML = userNumber;
    this._adminNumber.innerHTML = adminNumber;
    
  }//!updateCount

 // STORAGE OBJECTS
  // PASSES EACH LINE OF THE ELEMENTS FORM
  // IF YOU GENDER AND HAVE MARKED ADD IF ANYTHING ADD
  // ADD TO THE 'USER' OBJECT OF THE CLASS WHERE INFORMATION WILL BE SAVED
  getValue(formUser){
    let user = {};
    let isValid = true;

    [...formUser.elements].forEach(function(field){

    // If the fields 'name' 'email' 'password' are greater than -1 and their value is not empty.
      if(['name','email','password'].indexOf(field.name) > -1 && !field.value){

        field.parentElement.classList.add('has-error');
        isValid = false;

      }

      if(field.name == "gender"){
        if(field.checked){
          user[field.name] = field.value;
        }

      }else if(field.name == "admin"){
        user[field.name] = field.checked;
      }else{
        user[field.name] = field.value;
        
      } 
    });

    if(!isValid){
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
  
  }//!getValue

}//!class