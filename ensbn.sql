-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ensabunn_inventory
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ensabunn_inventory
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ensabunn_inventory` DEFAULT CHARACTER SET utf32 COLLATE utf32_turkish_ci ;
USE `ensabunn_inventory` ;

-- -----------------------------------------------------
-- Table `ensabunn_inventory`.`productType`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ensabunn_inventory`.`productType` ;

CREATE TABLE IF NOT EXISTS `ensabunn_inventory`.`productType` (
  `productTypeID` INT NOT NULL,
  `productType` VARCHAR(45) NULL,
  PRIMARY KEY (`productTypeID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ensabunn_inventory`.`product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ensabunn_inventory`.`product` ;

CREATE TABLE IF NOT EXISTS `ensabunn_inventory`.`product` (
  `productID` INT NOT NULL AUTO_INCREMENT,
  `productName` VARCHAR(45) NULL,
  `totalCost` DOUBLE NULL,
  `salePrice` DOUBLE NULL,
  `stockAmount` INT NULL,
  `productTypeID` INT NOT NULL,
  PRIMARY KEY (`productID`, `productTypeID`),
  CONSTRAINT `fk_product_productType`
    FOREIGN KEY (`productTypeID`)
    REFERENCES `ensabunn_inventory`.`productType` (`productTypeID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `ensabunn_inventory`.`productType`
-- -----------------------------------------------------
START TRANSACTION;
USE `ensabunn_inventory`;
INSERT INTO `ensabunn_inventory`.`productType` (`productTypeID`, `productType`) VALUES (1, 'Sabun');

COMMIT;


-- -----------------------------------------------------
-- Data for table `ensabunn_inventory`.`product`
-- -----------------------------------------------------
START TRANSACTION;
USE `ensabunn_inventory`;
INSERT INTO `ensabunn_inventory`.`product` (`productID`, `productName`, `totalCost`, `salePrice`, `stockAmount`, `productTypeID`) VALUES (1, 'Biberiye Çayağacı Zeytinyağlı Sabun', 151, 173, 32, 1);
INSERT INTO `ensabunn_inventory`.`product` (`productID`, `productName`, `totalCost`, `salePrice`, `stockAmount`, `productTypeID`) VALUES (2, 'Altınotlu Sabun', 124, 145, 23, 1);

COMMIT;

