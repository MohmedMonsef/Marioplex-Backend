const MockUser =  {
    
    users : [],
    checkmail : function(email){
        return this.users.find(user => user.email==email);
    },
    
    updateforgottenpassword: function(email){
        let user=this.users.find(user => user.email==email);
        if(!user) return 0;
        user.password=user.displayName+"1234";
        return user;
    }

}

const PassTest =  MockUser;
PassTest.users = [
   {
       email:"nada5aled52@gmail.com",
       displayName:"nada",
       password:"FREE"
   },
   {
    email:"nour@gmail.com",
    displayName:"nour",
    password:"nani"
   }
]


test('check if there is a user with email "nada5aled52@gmail.com which exists" ',()=>{
   expect(PassTest.checkmail("nada5aled52@gmail.com")).toEqual(
        {email:"nada5aled52@gmail.com",
        displayName:"nada",
        password:"FREE"
        });
})

test('check if there is a user with email "nada@gmail.com which doesnt exist " ',()=>{
    expect(PassTest.checkmail("nada@gmail.com")).toEqual(undefined);
 })

 test('update password for a user with email "nada5aled52@gmail.com which exists " ',()=>{
    expect(PassTest.updateforgottenpassword("nada5aled52@gmail.com")).toEqual(
     {email:"nada5aled52@gmail.com",
    displayName:"nada",
    password:"nada1234"
    });
 })

 test('update password for a user with email "nada@gmail.com which doesnt exist " ',()=>{
    expect(PassTest.updateforgottenpassword("nada@gmail.com")).toEqual(0);
 })




