class User {
  constructor(name, gender, birth, country, email, password, photo, admin){
    this._id;
    this._name = name;
    this._gender = gender;
    this._birth = birth;
    this._country = country;
    this._email = email;
    this._password = password;
    this._photo = photo;
    this._admin = admin;
    this._register = new Date();
    
  }

  //GET para quando for invocado

  get id (){
    return this._id;
  }

  set id (value){
    this._id =  value;
  }

  get register(){
    return this._register;
  }

  get name(){
    return this._name;
  }
  
  get gender (){
    return this._gender;
  }

  get birth(){
    return this._birth;
  }

  get country(){
    return this._country;
  }

  get email(){
    return this._email;
  }

  get password(){
    return this._password;
  }

  get admin(){
    return this._admin;
  }

  get photo(){
    return this._photo;
  }

  set photo(value){
    this._photo = value;
  }

  loadFromJson(json){
    for (let name in json){

      switch(name){
        case '_register':
          this[name] = new Date(json[name]);
          break;
        default:
          this[name] = json[name];
      }
    }
  }//!loadFromJson

  formNewId(){
    if (!window.id) window.id = 0;
    id++;

    return id;
  }//!formNewId

  save (){

    let users = User.getUsersSessionStorage();

    if(this.id > 0){
      users.map(u =>{
        if (u._id == this.id){
         Object.assign(u, this);
        }
        console.log(u);
        return u;
    })

    }else {
      this._id = this.formNewId()
      users.push(this)
    }
    localStorage.setItem('users',JSON.stringify(users));

  }//!save

  // SE DENTRO DA LOCALSTORAGE TIVER UMA SESSÃO COM O NOME 'users',
  // TRAGA PARA A VAREAVEL 'users',
  // TRANSFORME EM ARRAY

static  getUsersSessionStorage(){
  let users = [];
  if(localStorage.getItem('users')){
    users = JSON.parse(localStorage.getItem('users'));
  }
  return users
}//!getUsersSessionStorage
}
