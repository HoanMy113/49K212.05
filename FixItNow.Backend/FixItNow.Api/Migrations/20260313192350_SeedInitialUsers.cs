using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FixItNow.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone", "Role", "WorkerProfileId" },
                values: new object[,]
                {
                    { 101, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Nguyễn Văn A", "123456", "0900000001", 1, 101 },
                    { 102, new DateTime(2025, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Trần Thị B", "123456", "0900000002", 1, 102 },
                    { 103, new DateTime(2025, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Phạm C", "123456", "0900000003", 1, 103 },
                    { 104, new DateTime(2025, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Lê Văn D", "123456", "0900000004", 1, 104 },
                    { 105, new DateTime(2025, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Phạm Văn E", "123456", "0900000005", 1, 105 },
                    { 106, new DateTime(2025, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Khách Hàng Một", "123456", "0900000006", 0, null },
                    { 107, new DateTime(2025, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Khách Hàng Hai", "123456", "0900000007", 0, null },
                    { 108, new DateTime(2025, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Khách Hàng Ba", "123456", "0900000008", 0, null },
                    { 109, new DateTime(2025, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Khách Hàng Bốn", "123456", "0900000009", 0, null },
                    { 110, new DateTime(2025, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Khách Hàng Năm", "123456", "0900000010", 0, null }
                });

            migrationBuilder.InsertData(
                table: "WorkerProfiles",
                columns: new[] { "Id", "Address", "Description", "Location", "NameOrStore", "PhoneNumber", "Rating", "Services" },
                values: new object[,]
                {
                    { 101, "123 Lê Lợi, Quận 1", "Sửa điện nhanh chóng, an toàn", "Hồ Chí Minh", "Thợ Điện Nguyễn Văn A", "0900000001", 4.7999999999999998, "Sửa điện,Máy lạnh" },
                    { 102, "456 Trần Hưng Đạo, Hoàn Kiếm", "Chuyên sửa ống nước, vòi sen", "Hà Nội", "Trần Thị B Dịch Vụ Nước", "0900000002", 4.5, "Sửa nước" },
                    { 103, "789 Nguyễn Văn Linh, Hải Châu", "Thay lốc tủ lạnh, kiểm tra tivi", "Đà Nẵng", "Cửa hàng Sửa Chữa C", "0900000003", 5.0, "Điện gia dụng,Máy lạnh" },
                    { 104, "101 Lý Tự Trọng, Ninh Kiều", "Nhận sửa mọi thứ trong nhà", "Cần Thơ", "Lê Văn D - Đa năng", "0900000004", 4.2000000000000002, "Sửa điện,Sửa nước,Điện gia dụng" },
                    { 105, "202 Đồng Khởi, Biên Hòa", "Chuyên sửa cửa gỗ, tủ gỗ", "Đồng Nai", "Phạm Văn E Mộc", "0900000005", 4.7000000000000002, "Khác" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 105);
        }
    }
}
