class UserController {

  //Seletor de todos os formularios
  //Seletor que recebe novo elemento 'TR'
  //Função submit do formulario
  constructor(formIdUpdate,formIdCreate, targetID, userNumber, adminNumber, targetImage){
    this.formElementUpdate = document.getElementById(formIdUpdate);
    this.formElementCreate = document.getElementById(formIdCreate);
    this.formTarget = document.getElementById(targetID);
    this._userNumber = document.getElementById(userNumber);
    this._adminNumber = document.getElementById(adminNumber);
    this.previewFile();
    this.onSubmit();
    this.onClickCancel();
    this.updatePageWithData();
    this.imageTag = document.getElementById(targetImage);
  }

  previewFile(){
    let file = document.querySelectorAll('input[type=file]');
    let preview = document.querySelector('#preview');
    let reader  = new FileReader();
    
    file.forEach(e=>{
      e.addEventListener('change', ()=>{
        reader.onloadend = function () {
          preview.src = reader.result;
          console.log('ok');
        }
        reader.readAsDataURL(e.files[0])
        console.log('ok');
  
      })

    })
    
  }//!

  // SAI DA TELA DE EDIÇÃO USER
  onClickCancel(){
    document.querySelector('#box-user-update .btn-default').addEventListener('click', e=> {
      this.outInputBoxUpdate();

    });


    this.formElementUpdate.addEventListener('submit', (event)=>{
      event.preventDefault();
      
      let btn = this.formElementUpdate.querySelector('[type=submit]');
      let value = this.getValue(this.formElementUpdate);
      let index = this.formElementUpdate.dataset.trIndex
      let tr = this.formTarget.rows[index];
      let userOld = JSON.parse(tr.dataset.user);
      let result = Object.assign({}, userOld, value);
      
      
      btn.disabled = true;
      
      this.getPhoto(this.formElementUpdate).then(
        (content)=>{
          

        //SE O 'value.photo' NÃO EXISTIR, USE O QUE ESTA NO 'userOld'
        if(!value.photo){
            result._photo = userOld._photo
        } else{
          result._photo = content;
        }

        let user = new User();
        user.loadFromJson(result);
        user.save();
        tr = this.templateFromTR(user, tr)
          this.addEventsTr(tr);
          this.updateCount();
          btn.disabled = false;
          this.formElementCreate.reset();
          this.outInputBoxUpdate();
          
        },
        (e)=>{
          console.error(e)
        }
      );

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
      
      this.getPhoto(this.formElementCreate).then(
        (content)=>{
          value.photo = content;
          value.save()
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


  getPhoto(formElement){
    //PROMISE PARA QUANDO DÊ CERTOU OU ERRADO
    return new Promise((resolve, reject)=>{

      let fileReader = new FileReader();

      //BUSCA ENTRE OS ARRAYS
      let elements = [...formElement.elements].filter(item=>{
        //SE FOR 'item.name' IGUAL A 'photo' RETORNE ESSE ITEM
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



  // SE DENTRO DA LOCALSTORAGE TIVER UMA SESSÃO COM O NOME 'users',
  // TRAGA PARA A VAREAVEL 'users',
  // TRANSFORME EM ARRAY
getUsersSessionStorage(){
  let users = [];
  if(localStorage.getItem('users')){
    users = JSON.parse(localStorage.getItem('users'));
  }
  return users
}//!getUsersSessionStorage

  
  updatePageWithData(){
    let user = new User();
    let users = this.getUsersSessionStorage();

    users.forEach(dataUser=>{

      user.loadFromJson(dataUser);

      this.addLine(user);
    })


  }//!updatePageWithData

  
  // DÊ PUSH PARA OS NOVOS DADOS
  // TRANSFORME EM STRING E DEVOLVA PARA O LOCALSTORAGE
  updateFormWithData(data){
    let users = this.getUsersSessionStorage();
    users.push(data)
    localStorage.setItem('users',JSON.stringify(users));

  }//!updateFormWithData


  //ADD TAG TR DENTRO DA PAGE COM INFORMAÇÕES DOS FORMULARIOS
  // ADICIONAR AS INFORMAÇÕES DENTRO DO SESSION STORAGE
  //Guardar informações no dataset LOCALSTORAGE

  addLine(dataUser){
    
    let tr = this.templateFromTR(dataUser)
    
    this.formTarget.appendChild(tr);
    this.updateCount();
  }//!addLine


  templateFromTR(dataUser, tr = null){

    if(tr === null) tr = document.createElement('tr');
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

    return tr
  }

addEventsTr(tr){

  //EXCLUI 'TAG TR' DENTRO DA PAGE
  tr.querySelector('.btn-excluir').addEventListener('click', e=> {
    if(confirm("Deseja realmente?")){

      let user = new User();

      user.loadFromJson(JSON.parse(tr.dataset.user))

      user.remove();
      tr.remove();
      this.updateCount()
    }

  });


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