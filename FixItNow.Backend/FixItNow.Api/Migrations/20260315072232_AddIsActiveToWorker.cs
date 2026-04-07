using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FixItNow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToWorker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "WorkerProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 101,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 102,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 103,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 104,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "WorkerProfiles",
                keyColumn: "Id",
                keyValue: 105,
                column: "IsActive",
                value: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "WorkerProfiles");
        }
    }
}
