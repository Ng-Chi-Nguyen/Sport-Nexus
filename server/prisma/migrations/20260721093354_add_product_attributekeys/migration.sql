-- CreateTable
CREATE TABLE `productattributekeys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `attribute_key_id` INTEGER NOT NULL,

    UNIQUE INDEX `productattributekeys_product_id_attribute_key_id_key`(`product_id`, `attribute_key_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `productattributekeys` ADD CONSTRAINT `productattributekeys_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productattributekeys` ADD CONSTRAINT `productattributekeys_attribute_key_id_fkey` FOREIGN KEY (`attribute_key_id`) REFERENCES `attributekeys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
