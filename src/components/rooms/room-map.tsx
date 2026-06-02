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
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">📍 Vị trí phòng</h2>
        <p className="mt-2 text-sm text-slate-600">Phòng này chưa công khai vị trí bản đồ. Vui lòng dùng địa chỉ mô tả hoặc liên hệ chủ trọ.</p>
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{address}</p>
      </section>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">📍 Vị trí phòng</h2>
          <p className="mt-2 text-sm text-slate-600">{address}</p>
        </div>
        <a href={googleDirectionsUrl(latitude, longitude)} target="_blank" rel="noreferrer" className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
          Chỉ đường tới phòng
        </a>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border bg-slate-100">
        <iframe title={`Bản đồ ${title}`} src={mapUrl} className="h-72 w-full border-0 sm:h-96 lg:h-[28rem]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
  );
}
