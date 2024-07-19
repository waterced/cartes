import css from '@/components/css/convertToJs'
import TechDependenciesGallery from '@/components/TechDependenciesGallery'
import { PresentationWrapper } from '../presentation/UI'
import Link from 'next/link'
import regions from './regions.yaml'
import regionsAoms from './regionsAoms.yaml'

const title = 'Transports en commun'
const description = `
Découvrez les plans de chaque réseau de transport en commun en France,
et calculez vos itinéraires en bus, en tram, en métro, en train (TER,
Intercités, TGV, Ouigo, train de nuit) et la combinaison multimodale
des transports publics avec le vélo et la marche.
`

export const metadata: Metadata = {
	title,
	description,
}
export default async function () {
	const implementedDatasetsRequest = await fetch(
		'https://raw.githubusercontent.com/laem/gtfs/master/input.yaml'
	)
	const implementedDatasets = await implementedDatasetsRequest.json().datasets

	const panRequest = await fetch('https://transport.data.gouv.fr/api/datasets/')
	const datasets = await panRequest.json()
	const enriched = datasets
		.filter((dataset) =>
			dataset.resources.find((resource) => resource.format === 'GTFS')
		)
		.map((dataset) => {
			const france = dataset.covered_area?.country?.name
			const isRegion = dataset.covered_area?.region?.name
			const aomSiren = dataset.aom?.siren
			const aomName = dataset.aom?.name
			const citiesName =
				dataset.covered_area?.type === 'cities' && dataset.covered_area.name

			if (![france, isRegion, aomSiren, citiesName].some(Boolean))
				console.log(dataset.covered_area)
			return {
				...dataset,
				isRegion,
				aomSiren,
				aomName,
				france,
				citiesName,
			}
		})

	const national = enriched.filter((dataset) => dataset.france)

	const aoms = enriched.filter((dataset) => dataset.aomSiren),
		enrichedAoms = await Promise.all(
			aoms.map(async (dataset) => {
				const { region } = regionsAoms.find(
					({ siren }) => siren == dataset.aomSiren
				)
				return {
					...dataset,
					region,
				}
			})
		)

	return (
		<PresentationWrapper>
			<header>
				<h1>{title}</h1>
				<p>{description}</p>
			</header>

			<section
				style={css`
					margin: 2rem 0;
				`}
			>
				{' '}
				<p>
					Les réseaux de transport en commun sont ajoutés progressivement sur
					Cartes.
				</p>
				<h2>Réseaux nationaux</h2>
				<ul>
					{national.map((dataset) => {
						/* //TODO get with a match between resource.metadata.networks and http://localhost:3001/agencies's title :/
						const présent = implementedDatasets.find(
							({ slug }) => slug === dataset.slug
						)
						if (présent) {
							const agence = null
							return (
								<Link
									href={`https://cartes.app/?transports=oui&agence=${agence}`}
								>
									{dataset.title}
								</Link>
							)
						}
						*/
						return <li key={dataset.slug}>{dataset.title}</li>
					})}
				</ul>
				<h2>Réseaux par région</h2>
				<ul>
					{regions.map(({ code, nom }) => {
						const main = enriched.find((dataset) => dataset.isRegion === nom)
						return (
							<li key={code}>
								<h3>{nom}</h3>
								{main && (
									<div>
										<h4>Réseau régional unifié</h4>
										<div>{main.title}</div>
									</div>
								)}
								{main && <h4>Réseaux régionaux</h4>}
								<ul>
									{enrichedAoms
										.filter((aom) => aom.region === nom)
										.map((dataset) => (
											<li key={dataset.slug}>{dataset.title}</li>
										))}
								</ul>
							</li>
						)
					})}
				</ul>
			</section>
		</PresentationWrapper>
	)
}
