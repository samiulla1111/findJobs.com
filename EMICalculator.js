function calculateEMI(){
    var P=parseInt(document.getElementById("principalAmount").value);
    var r=parseInt(document.getElementById("interestRate").value);
    var N=parseInt(document.getElementById("tenure").value);
    
    var R=r/1200;
    var EMI=((P*R)/(1-(Math.pow(1+R),N)));
    document.getElementById("result").innerText="EMI is Rs."+EMI
    console.log(EMI);
    return false;
    
}
/* 

    Fill with appropriate javascript code here 

*/