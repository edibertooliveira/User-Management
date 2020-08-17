class Utils {
  //formata data da class Date nativo do windows
  static dateFormat(data){
    return data.getDate()+'/'+(data.getMonth()+1)+'/'+data.getFullYear()+' - '+data.getHours()+':'+data.getMinutes();
  }
}