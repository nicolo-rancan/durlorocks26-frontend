import { useEffect, useState } from 'react';
import { useEdition } from '@/contexts/EditionContext';
import { prevenditeApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { RiTicketLine, RiCheckboxCircleLine, RiUserLine, RiGroupLine } from 'react-icons/ri';

function StatCard({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className={`p-3 rounded-xl bg-surface-3 ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { edizione } = useEdition();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    prevenditeApi.getStats(edizione)
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [edizione]);

  const pct = stats ? Math.round((stats.validate / (stats.totale || 1)) * 100) : 0;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Riepilogo {edizione}</h2>
        <p className="text-gray-500 text-sm mt-1">Stato prevendite edizione corrente</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <StatCard icon={RiTicketLine} label="Totale prevendite" value={stats?.totale} color="text-brand" />
          <StatCard icon={RiCheckboxCircleLine} label="Validate" value={stats?.validate} color="text-green-400" />
          <StatCard icon={RiUserLine} label="Maggiorenni" value={stats?.maggiorenni} color="text-blue-400" />
          <StatCard icon={RiGroupLine} label="Minorenni" value={stats?.minorenni} color="text-purple-400" />

          {stats?.totale > 0 && (
            <Card>
              <CardContent className="pt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Tasso di convalida</span>
                  <span className="font-semibold text-brand">{pct}%</span>
                </div>
                <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {stats.validate} / {stats.totale} convalidate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
