import { Sequelize } from "sequelize";

 export const sequelize = new Sequelize('e_commerce_db', 'root', 'HAm$0448448', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging:false 
    
});

export const dbConnection = async() =>{
    try {

        await sequelize.authenticate();
        console.log('DB connection has been established successfully...!!!!!');
           
    } catch (error) {
        console.error("unable to connect the database..!!")
        console.log(error);
        
    }
}

