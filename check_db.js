import sequelize from './config/db.js';

async function checkTable() {
    try {
        const [results] = await sequelize.query("DESCRIBE usuarios");
        console.log("--- Table Structure ---");
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error checking table:", error);
        process.exit(1);
    }
}

checkTable();
