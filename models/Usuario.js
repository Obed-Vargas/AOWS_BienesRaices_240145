import { DataTypes } from "sequelize";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const Usuario = db.define('Usuario', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacio'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'El correo ya esta registrado'
        },
        validate: {
            isEmail: {
                msg: 'debe proporcionar un email valido'
            },
            notEmpty: {
                msg: 'El email no puede estar vacio'
            }
        }
    },
    password: {
        type: DataTypes.STRING(225),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La contraseña no puede estar vacio'
            },
            len: {
                args: [8, 100],
                msg: 'La contraseña debe tener al menos 8 caracteres'
            }
        }
    },
    confirmado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'configurado'
    },
    tokenRecuperacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'token_recuperacion'
    },
    tokenExpiracion: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'token_expiracion'
    },
    regStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'reg_status'
    },
    ultimoAcceso: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ultimo_acceso'
    }


}, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    createdAt: 'create_at',
    updatedAt: 'update_at',

    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
})

export default Usuario;