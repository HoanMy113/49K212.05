// using backend0603.Components;
// using Microsoft.EntityFrameworkCore; // 1. Thêm thư viện EF Core
// using FixItNow.Data;                 // 2. Thêm đường dẫn tới thư mục Data chứa AppDbContext

// var builder = WebApplication.CreateBuilder(args);

// // --- PHẦN THÊM MỚI CHO API VÀ DATABASE ---

// // 3. Đăng ký AppDbContext kết nối với SQL Server
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// // 4. Kích hoạt tính năng API Controllers
// builder.Services.AddControllers();

// // -----------------------------------------

// // Add services to the container (Code mặc định của bạn).
// builder.Services.AddRazorComponents()
//     .AddInteractiveServerComponents();

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (!app.Environment.IsDevelopment())
// {
//     app.UseExceptionHandler("/Error", createScopeForErrors: true);
//     app.UseHsts();
// }

// app.UseHttpsRedirection();

// app.UseStaticFiles();
// app.UseAntiforgery();

// app.MapRazorComponents<App>()
//     .AddInteractiveServerRenderMode();

// // 5. Ánh xạ các đường dẫn API (Route) để có thể gọi được /api/repairprofiles
// app.MapControllers();

// app.Run();

using backend0603.Components;
using Microsoft.EntityFrameworkCore; 
using FixItNow.Data;                 

var builder = WebApplication.CreateBuilder(args);

// --- 1. THÊM MỚI: CẤU HÌNH CORS ---
// Cho phép bất kỳ Frontend nào (AllowAnyOrigin) cũng có thể gọi vào API này
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
// ---------------------------------

// Đăng ký AppDbContext kết nối với SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Kích hoạt tính năng API Controllers
builder.Services.AddControllers();

// Add services to the container (Code mặc định của bạn).
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();

// --- 2. THÊM MỚI: KÍCH HOẠT CORS ---
// Lưu ý: Lệnh này phải đặt TRƯỚC app.MapControllers()
app.UseCors("AllowAll");
// -----------------------------------

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Ánh xạ các đường dẫn API (Route)
app.MapControllers();

app.Run();