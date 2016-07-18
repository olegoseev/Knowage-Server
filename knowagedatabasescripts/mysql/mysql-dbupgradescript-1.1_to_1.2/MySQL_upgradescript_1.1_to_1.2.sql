ALTER TABLE SBI_CATALOG_FUNCTION ADD COLUMN DESCRIPTION TEXT NOT NULL AFTER NAME;

ALTER TABLE SBI_PARUSE ADD COLUMN OPTIONS VARCHAR(4000) NULL DEFAULT NULL;

ALTER TABLE  SBI_GEO_MAPS ADD COLUMN HIERARCHY_NAME VARCHAR(100) AFTER FORMAT;
ALTER TABLE  SBI_GEO_MAPS ADD COLUMN NUM_LEVEL INTEGER AFTER HIERARCHY_NAME;
ALTER TABLE  SBI_GEO_MAPS ADD COLUMN MEMBER_NAME VARCHAR(100) AFTER NUM_LEVEL;

-- SET FOREIGN_KEY_CHECKS=0;
-- DELETE from SBI_USER_FUNC  where name = 'CreateWorksheetFromDatasetUserFunctionality';
-- DELETE FROM SBI_OBJECTS WHERE ENGINE_ID = (select engine_id from SBI_ENGINES  where name = 'Worksheet Engine');
-- DELETE from SBI_ENGINES  where name = 'Worksheet Engine';
-- DELETE from SBI_DOMAINS where value_cd = 'WORKSHEET';
-- SET FOREIGN_KEY_CHECKS=1;

ALTER TABLE SBI_DATA_SET ADD COLUMN IS_PERSISTED_HDFS TINYINT(1) DEFAULT '0' AFTER IS_PERSISTED;

DELETE FROM SBI_ROLE_TYPE_USER_FUNC WHERE USER_FUNCT_ID IN (SELECT USER_FUNCT_ID FROM SBI_USER_FUNC WHERE NAME = 'ConfigManagement');
DELETE FROM SBI_ROLE_TYPE_USER_FUNC WHERE USER_FUNCT_ID IN (SELECT USER_FUNCT_ID FROM SBI_USER_FUNC WHERE NAME = 'DomainManagement');
DELETE FROM SBI_USER_FUNC WHERE NAME = 'ConfigManagement';
DELETE FROM SBI_USER_FUNC WHERE NAME = 'DomainManagement';

ALTER TABLE SBI_META_MODELS_VERSIONS CHANGE COLUMN CONTENT CONTENT MEDIUMBLOB NULL;
ALTER TABLE SBI_META_MODELS_VERSIONS ADD COLUMN FILE_MODEL MEDIUMBLOB NULL AFTER NAME;

ALTER TABLE SBI_OBJ_METACONTENTS ADD COLUMN ADDITIONAL_INFO VARCHAR(255) NULL DEFAULT NULL AFTER ORGANIZATION;

ALTER TABLE SBI_DATA_SET DROP IS_PUBLIC;