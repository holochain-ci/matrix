defmodule Matrix.Github do
  alias Tentacat.Repositories

  def repos(github_org) do
    _repos(Repositories.list_users(github_org))
  end

  defp _repos({200, repos, _}) do
    _repos(repos)
  end

  defp _repos([head|tail]) do
    [head|tail]
  end

  defp _repos([]) do
    :no_repos
  end

  defp _repos({403, error, _}) do
    IO.inspect(error["message"])
    :err
  end

  defp _repos(error) do
    IO.inspect(error)
    :err
  end
end
