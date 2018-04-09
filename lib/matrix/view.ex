defmodule Matrix.View do
  #  TODO in production -- precompile template:
  #  require Slime
  #  Slime.function_from_file(:def, :render, "lib/matrix/view.slim", [:github_org, :repos])

  def render(github_org, repos) do
    {:ok, template} = File.read('lib/matrix/view.slim')
    Slime.render(template, github_org: github_org, repos: repos)
  end
end
