using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FixItNow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRejectedWorkerIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RejectedWorkerIds",
                table: "RepairRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RejectedWorkerIds",
                table: "RepairRequests");
        }
    }
}
