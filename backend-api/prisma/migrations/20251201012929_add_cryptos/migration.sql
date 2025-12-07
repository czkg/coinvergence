-- CreateTable
CREATE TABLE "CryptoAsset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coinId" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoPrice" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "marketCap" DECIMAL(65,30),
    "volume24h" DECIMAL(65,30),
    "change24h" DECIMAL(65,30),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoOHLC" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "open" DECIMAL(65,30) NOT NULL,
    "high" DECIMAL(65,30) NOT NULL,
    "low" DECIMAL(65,30) NOT NULL,
    "close" DECIMAL(65,30) NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoOHLC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CryptoAsset_symbol_key" ON "CryptoAsset"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoAsset_coinId_key" ON "CryptoAsset"("coinId");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoPrice_assetId_key" ON "CryptoPrice"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoOHLC_assetId_interval_timestamp_key" ON "CryptoOHLC"("assetId", "interval", "timestamp");

-- AddForeignKey
ALTER TABLE "CryptoPrice" ADD CONSTRAINT "CryptoPrice_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CryptoAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoOHLC" ADD CONSTRAINT "CryptoOHLC_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CryptoAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
