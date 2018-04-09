defmodule Matrix.MixProject do
  use Mix.Project

  def project do
    [
      app: :matrix,
      version: "0.1.0",
      elixir: "~> 1.6",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: applications(Mix.env()),
      mod: {Matrix.Application, []}
    ]
  end

  defp applications(:dev) do
    applications(:all) ++ [:remix]
  end

  defp applications(_) do
    [:logger, :tentacat]
  end

  defp deps do
    [
      {:arthur, only: :dev, git: "https://github.com/harlantwood/arthur", branch: "dev"},
      {:cowboy, "~> 1.1"},
      {:credo, "~> 0.9.0", only: [:dev, :test], runtime: false},
      {:plug, "~> 1.5.0"},
      {:plugs, "~> 0.1.1"},
      {:remix, only: :dev, git: "https://github.com/harlantwood/remix.git"},
      {:slime, "~> 1.1"},
      {:tentacat, "~> 0.9.0"}
    ]
  end
end
