function initLoginPage() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    const user = dataPengguna.find(
      (u) => u.email === email && u.password === pass
    );

    if (!user) {
      alert("Email atau password salah!");
      return;
    }

    sessionStorage.setItem("user", JSON.stringify(user));
    location.href = "dashboard.html";
  });
}

function initDashboard() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return (location.href = "login.html");

  const hour = new Date().getHours();
  let greetingTime = "";
  if (hour >= 5 && hour < 12) {
    greetingTime = "Selamat pagi, ";
  } else if (hour >= 12 && hour < 15) {
    greetingTime = "Selamat siang, ";
  } else if (hour >= 15 && hour < 18) {
    greetingTime = "Selamat sore, ";
  } else {
    greetingTime = "Selamat malam, ";
  }

  document.getElementById("greeting").textContent =
    greetingTime + user.nama + " (" + user.role + ")";

  function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("currentTime").textContent = timeString;
  }
  updateTime();
  setInterval(updateTime, 1000);

  document.getElementById("btnLogout").onclick = () => {
    sessionStorage.clear();
    location.href = "login.html";
  };
}

function renderKatalogPage() {
  const container = document.getElementById("catalogGrid");
  container.innerHTML = "";

  dataKatalogBuku.forEach(buku => {
    const card = document.createElement("div");
    card.className = "catalog-item glass animate-card";

    card.innerHTML = `
      <img src="${buku.cover}" alt="${buku.namaBarang}">
      <h4>${buku.namaBarang}</h4>
      <p>${buku.jenisBarang} - Edisi ${buku.edisi}</p>
      <p>Stok: ${buku.stok}</p>
      <strong>${buku.harga}</strong>
    `;

    container.appendChild(card);
  });
}

function selectBook(namaBarang) {
  localStorage.setItem("selectedBook", namaBarang);
  window.location.href = "checkout.html";
}

function generateNomorDO() {
  const tahun = new Date().getFullYear();
  const urutan = Math.floor(Math.random() * 9000) + 1000;
  return `${tahun}${urutan}`;
}

function initCheckoutPage() {
  const selectedBook = localStorage.getItem("selectedBook");
  const bukuSelect = document.getElementById("bukuSelect");

  dataKatalogBuku.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.namaBarang;
    opt.textContent = `${b.namaBarang} (${formatHarga(b.harga)})`;
    if (selectedBook === b.namaBarang) opt.selected = true;
    bukuSelect.appendChild(opt);
  });

  const form = document.getElementById("orderForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const alamat = document.getElementById("alamat").value.trim();
    const telepon = document.getElementById("telepon").value.trim();
    const email = document.getElementById("email").value.trim();
    const namaBuku = bukuSelect.value;
    const jumlah = parseInt(document.getElementById("jumlah").value);
    const pembayaran = document.getElementById("pembayaran").value;

    if (!nama || !alamat || !telepon || !email || !namaBuku || jumlah <= 0) {
      alert("Harap isi semua field dengan benar!");
      return;
    }

    const buku = dataKatalogBuku.find((b) => b.namaBarang === namaBuku);
    if (!buku) {
      alert("Buku tidak ditemukan!");
      return;
    }

    const total = buku.harga * jumlah;
    const nomorDO = generateNomorDO();

    dataTracking[nomorDO] = {
      nomorDO,
      nama,
      alamat,
      telepon,
      email,
      buku: buku.namaBarang,
      jumlah,
      total,
      pembayaran,
      status: "Diterima",
      ekspedisi: "Pos Indonesia",
      tanggalKirim: new Date().toISOString().split("T")[0],
      paket: "AUTO" + Math.floor(Math.random() * 999),
      pengirim: "Universitas Terbuka",
      perjalanan: [
        {
          waktu: "2025-08-25 10:12:20",
          keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka"
        },
        {
          waktu: "2025-08-25 14:07:56",
          keterangan: "Tiba di Hub: TANGERANG SELATAN"
        },
        {
          waktu: "2025-08-25 16:30:10",
          keterangan: "Diteruskan ke Kantor Kota Bandung"
        },
        {
          waktu: "2025-08-26 12:15:33",
          keterangan: "Tiba di Hub: Kota BANDUNG"
        },
        {
          waktu: "2025-08-26 15:06:12",
          keterangan: "Proses antar ke Cimahi"
        },
        {
          waktu: "2025-08-26 20:00:00",
          keterangan: "Selesai Antar. Penerima: Agus Pranoto"
        }
      ],
    };

    localStorage.setItem("dataTracking", JSON.stringify(dataTracking));
    localStorage.setItem("lastOrder", JSON.stringify(dataTracking[nomorDO]));

    document.getElementById("orderResult").innerHTML = `
      <h4>Hore, Pesanan Berhasil Dibuat!!, Yuk Lacak Pesenan Anda Sekarang!!</h4>
      <p>Nama: ${nama}</p>
      <p>Alamat: ${alamat}</p>
      <p>Telepon: ${telepon}</p>
      <p>Email: ${email}</p>
      <p>Buku: ${buku.namaBarang}</p>
      <p>Jumlah: ${jumlah}</p>
      <p>Metode Pembayaran: ${pembayaran}</p>
      <p>Total: ${formatHarga(total)}</p>
      <p><b>Nomor DO: <span class="highlight">${nomorDO}</span></b></p>
      <small>Gunakan nomor DO ini untuk melacak di halaman Tracking</small>
      <br><br>
      <button class="btn primary" onclick="goToTracking('${nomorDO}')">Lacak Pesanan Anda Yuk!!</button>
    `;

    form.reset();
    localStorage.removeItem("selectedBook");
  });
}

function goToTracking(noDO) {
  localStorage.setItem("trackNow", noDO);
  window.location.href = "tracking.html";
}

function initTrackingPage() {
  const form = document.getElementById("trackingForm");
  const result = document.getElementById("trackingResult");

  const presetDO = localStorage.getItem("trackNow");
  if (presetDO) {
    document.getElementById("noDO").value = presetDO;
    localStorage.removeItem("trackNow");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const noDO = document.getElementById("noDO").value.trim();

    const currentDataTracking = JSON.parse(localStorage.getItem("dataTracking")) || dataTracking;
    const data = currentDataTracking[noDO];

    if (!data) {
      result.innerHTML = "<p>Nomor DO tidak ditemukan.</p>";
      return;
    }

    let perjalananHTML = "";
    data.perjalanan.forEach((p) => {
      perjalananHTML += `<li><strong>${p.waktu}</strong> — ${p.keterangan}</li>`;
    });

    result.innerHTML = `
      <h4>Nomor DO: ${data.nomorDO}</h4>
      <p>Nama: ${data.nama}</p>
      <p>Alamat: ${data.alamat}</p>
      <p>Telepon: ${data.telepon}</p>
      <p>Email: ${data.email}</p>
      <p>Buku: ${data.buku}</p>
      <p>Jumlah: ${data.jumlah}</p>
      <p>Metode Pembayaran: ${data.pembayaran}</p>
      <p>Total: ${formatHarga(data.total)}</p>
      <p>Status: <b>${data.status}</b></p>
      <p>Ekspedisi: ${data.ekspedisi}</p>
      <p>Tanggal Kirim: ${data.tanggalKirim}</p>
      <p>Pengirim: ${data.pengirim}</p>  <!-- Tampilkan pengirim -->
      <h4>Riwayat Pengiriman:</h4>
      <ul>${perjalananHTML}</ul>
    `;
  });
}