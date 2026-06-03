type RoomMapProps = {
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

function googleDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function RoomMap({ title, address, latitude, longitude }: RoomMapProps) {
  if (latitude === null || longitude === null) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
        <h2 className="text-3xl font-bold text-[#111827]">📍 Vị trí phòng</h2>
        <p className="mt-2 text-sm font-normal text-[#6B7280]">Phòng này chưa công khai vị trí bản đồ. Vui lòng dùng địa chỉ mô tả hoặc liên hệ chủ trọ.</p>
        <p className="mt-4 rounded-2xl bg-slate-50 p-6 text-sm font-normal text-[#6B7280]">{address}</p>
      </section>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=960x480&markers=${latitude},${longitude},red-pushpin`;

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#111827]">📍 Vị trí phòng</h2>
          <p className="mt-2 text-sm font-normal text-[#6B7280]">{address}</p>
        </div>
        <a href={googleDirectionsUrl(latitude, longitude)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg">
          Chỉ đường tới phòng
        </a>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border bg-slate-100">
        <iframe title={`Bản đồ ${title}`} src={mapUrl} srcDoc={`<a href="${googleDirectionsUrl(latitude, longitude)}" target="_blank" rel="noreferrer"><img src="${staticMapUrl}" alt="Bản đồ ${title}" style="width:100%;height:100%;object-fit:cover;border:0" loading="lazy" /></a>`} className="h-72 w-full border-0 sm:h-96 lg:h-[28rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
  );
}
