-- AlterTable
ALTER TABLE `brands` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `categories` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `coupons` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `products` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `productvariants` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `suppliers` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- AlterTable
ALTER TABLE `users` MODIFY `deleted_at` DATETIME(3) NOT NULL DEFAULT '1000-01-01 00:00:00';

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(191) NOT NULL,
    `order_id` INTEGER NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_email` VARCHAR(191) NULL,
    `customer_phone` VARCHAR(191) NULL,
    `shipping_address` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `vat_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.08,
    `vat_amount` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    UNIQUE INDEX `invoices_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
