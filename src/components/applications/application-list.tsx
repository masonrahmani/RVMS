"use client";

const placeholderApplications = [
  { id: "1", name: "Application A", category: "Web" },
  { id: "2", name: "Application B", category: "Mobile" },
  { id: "3", name: "Application C", category: "API" },
];

export const ApplicationList = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Applications</h2>
      <ul>
        {placeholderApplications.map((app) => (
          <li key={app.id} className="py-2">
            {app.name} - {app.category}
          </li>
        ))}
      </ul>
    </div>
  );
};
