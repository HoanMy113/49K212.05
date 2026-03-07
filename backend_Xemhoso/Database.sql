/* =========================================
   FixItNow Database Setup Script
   ========================================= */




CREATE DATABASE FixItNowDB;
GO

USE FixItNowDB;
GO


/* =========================================
   1. TABLE: RepairProfiles
   ========================================= */

IF OBJECT_ID('dbo.RepairProfiles', 'U') IS NOT NULL
DROP TABLE dbo.RepairProfiles;
GO

CREATE TABLE dbo.RepairProfiles
(
    Id INT IDENTITY(1,1) PRIMARY KEY,

    Name NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(30) NOT NULL,
    Address NVARCHAR(300) NULL,
    Description NVARCHAR(MAX) NULL,

    SkillsJson NVARCHAR(MAX) NULL,
    ServiceAreasJson NVARCHAR(MAX) NULL,
    ServicesJson NVARCHAR(MAX) NULL,

    Rating FLOAT NOT NULL DEFAULT 0,

    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


/* =========================================
   2. INDEX
   ========================================= */

CREATE INDEX IX_RepairProfiles_Phone
ON dbo.RepairProfiles(Phone);
GO


/* =========================================
   3. CONSTRAINTS
   ========================================= */

ALTER TABLE dbo.RepairProfiles
ADD CONSTRAINT CK_RepairProfiles_Rating
CHECK (Rating >= 0 AND Rating <= 5);
GO


/* =========================================
   4. TRIGGER auto update UpdatedAt
   ========================================= */

CREATE OR ALTER TRIGGER TR_RepairProfiles_UpdatedAt
ON dbo.RepairProfiles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE rp
    SET UpdatedAt = SYSUTCDATETIME()
    FROM dbo.RepairProfiles rp
    INNER JOIN inserted i ON rp.Id = i.Id;
END
GO


/* =========================================
   5. SEED DATA (Sample technicians)
   ========================================= */

INSERT INTO dbo.RepairProfiles
(Name,Phone,Address,Description,SkillsJson,ServiceAreasJson,ServicesJson,Rating)
VALUES

(
N'Nguyễn Văn Thành',
'0901234567',
N'Hà Nội',
N'12 năm kinh nghiệm sửa điện dân dụng và lắp đặt thiết bị điện.',
N'["Sửa điện","Lắp bóng đèn"]',
N'["Cầu Giấy","Đống Đa","Ba Đình"]',
N'["Sửa điện","Lắp bóng đèn","Lắp quạt trần"]',
4.8
),

(
N'Trần Minh Hoàng',
'0912345678',
N'TP Hồ Chí Minh',
N'Chuyên sửa máy lạnh và máy giặt cho hộ gia đình.',
N'["Sửa máy lạnh","Sửa máy giặt"]',
N'["Quận 1","Quận 3","Bình Thạnh"]',
N'["Sửa máy lạnh","Sửa máy giặt","Sửa tủ lạnh"]',
4.7
),

(
N'Lê Quốc Huy',
'0988123456',
N'Đà Nẵng',
N'Kỹ thuật viên điện lạnh hơn 8 năm kinh nghiệm.',
N'["Sửa máy lạnh","Sửa tủ lạnh"]',
N'["Hải Châu","Thanh Khê","Sơn Trà"]',
N'["Sửa máy lạnh","Sửa tủ lạnh"]',
4.5
),

(
N'Phạm Đức Long',
'0977654321',
N'Hải Phòng',
N'Chuyên sửa khóa cửa, khoan treo kệ và lắp đặt nội thất nhỏ.',
N'["Sửa khóa cửa","Khoan treo kệ"]',
N'["Ngô Quyền","Lê Chân"]',
N'["Sửa khóa cửa","Khoan treo kệ","Sơn sửa nhỏ"]',
4.4
),

(
N'Hoàng Văn Dũng',
'0933444555',
N'Cần Thơ',
N'Chuyên xử lý hệ thống nước, thông tắc cống.',
N'["Sửa ống nước"]',
N'["Ninh Kiều","Cái Răng"]',
N'["Sửa ống nước","Thông tắc cống","Sửa máy bơm"]',
4.6
),

(
N'Ngô Anh Tuấn',
'0966777888',
N'Bình Dương',
N'Thợ sửa chữa thiết bị gia dụng tại nhà.',
N'["Sửa máy giặt","Sửa tủ lạnh"]',
N'["Thủ Dầu Một"]',
N'["Sửa máy giặt","Sửa tủ lạnh"]',
4.3
),

(
N'Đặng Quang Huy',
'0911112222',
N'Khánh Hòa',
N'Chuyên lắp đặt camera và thiết bị an ninh gia đình.',
N'["Lắp camera"]',
N'["Nha Trang"]',
N'["Lắp camera gia đình","Lắp rèm cửa"]',
4.2
)
GO


/* =====================================================
   7. CHECK DATA
   ===================================================== */

SELECT *
FROM dbo.RepairProfiles
GO