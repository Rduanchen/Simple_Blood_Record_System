import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface ShareCodeAttributes {
  id: string;
  ownerId: string;
  createdAt: Date;
  expiresAt: Date;
}

interface ShareCodeCreationAttributes extends Optional<ShareCodeAttributes, 'id' | 'createdAt'> {}

class ShareCode extends Model<ShareCodeAttributes, ShareCodeCreationAttributes> implements ShareCodeAttributes {
  public id!: string;
  public ownerId!: string;
  public createdAt!: Date;
  public expiresAt!: Date;
}

ShareCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ShareCode',
    tableName: 'share_codes',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'share_code_id_index',
        fields: ['id']
      },
      {
        name: 'share_code_owner_id_index',
        fields: ['ownerId']
      }
    ],
  }
);

export default ShareCode;