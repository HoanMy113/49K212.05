var dtoAddress = "Số 1, Cầu Giấy, Hà Nội"; // or maybe something like TP Hồ Chí Minh
var t1 = "123 Lê Lợi, Quận 1, TP Hồ Chí Minh";
var reqProvince = "Hà Nội".ToLower();

var testCases = new[] { "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hà Nam", "Hà Nam Định (fake)", "TP Hồ Chí Minh" };

foreach (var wLoc in testCases) {
    var p = wLoc.ToLower();
    var match = reqProvince.Contains(p) || p.Contains(reqProvince);
    Console.WriteLine($"req: {reqProvince}, w: {p} => {match}");
}
