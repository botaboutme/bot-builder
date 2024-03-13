interface StatisticsCardProps {
  title: string;
  value: string | number; // Assuming value can be either string or number
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
    <h5 className=" text-sm font-bold">{title}</h5>
    <p className="text-xl">{value}</p>
  </div>
);
