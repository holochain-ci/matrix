defmodule Matrix.Router do
  alias Matrix.Github
  alias Matrix.View

  use Plug.Router

  plug(Sugar.Plugs.HotCodeReload)

  plug(
    Plug.Static,
    at: "/",
    from: :matrix,
    only: ~w(favicon.ico images js styles robots.txt)
  )

  plug(:match)
  plug(:dispatch)

#  get "/holochain" do
#    send_resp(conn, 200, "holo!")
#  end

  get "/:github_org" do
    repos = Github.repos(github_org)
    html = View.render(github_org, repos)
    send_resp(conn, 200, html)
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
